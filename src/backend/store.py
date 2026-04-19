from __future__ import annotations
import boto3
import logging
import asyncio
import json
from typing import Optional
from botocore.exceptions import ClientError, NoCredentialsError
from models import TaskResponse, ChatSession, ChatMessage
from config import AWS_REGION



logger = logging.getLogger(__name__)
TABLE_NAME = "gen_val_tasks"
SESSION_TABLE_NAME = "gen_val_sessions"
_dynamodb = None
_table = None
_session_table = None
_streams: dict[str, list[asyncio.Queue]] = {}
_memory_store: dict[str, TaskResponse] = {}
_session_store: dict[str, ChatSession] = {}
_use_memory: bool = False
_use_memory_sessions: bool = False


def _set_memory_mode():
    global _use_memory
    _use_memory = True


def get_table():
    global _dynamodb, _table
    if _use_memory:
        return None
    if _table is None:
        try:
            _dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
            _table = _dynamodb.Table(TABLE_NAME)
        except Exception:
            _set_memory_mode()
            return None
    return _table


def get_session_table():
    global _dynamodb, _session_table, _use_memory_sessions
    if _use_memory_sessions:
        return None
    if _session_table is None:
        try:
            if _dynamodb is None:
                _dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
            _session_table = _dynamodb.Table(SESSION_TABLE_NAME)
        except Exception:
            _use_memory_sessions = True
            return None
    return _session_table


def init_db():
    global _use_memory, _use_memory_sessions
    try:
        dynamodb = boto3.client("dynamodb", region_name=AWS_REGION)
        dynamodb.describe_table(TableName=TABLE_NAME)
        logger.info("DynamoDB table %s exists.", TABLE_NAME)
    except (NoCredentialsError, Exception) as e:
        if isinstance(e, ClientError) and e.response['Error']['Code'] == 'ResourceNotFoundException':
            try:
                logger.info("Creating DynamoDB table %s...", TABLE_NAME)
                dynamodb = boto3.client("dynamodb", region_name=AWS_REGION)
                dynamodb.create_table(
                    TableName=TABLE_NAME,
                    KeySchema=[{"AttributeName": "task_id", "KeyType": "HASH"}],
                    AttributeDefinitions=[{"AttributeName": "task_id", "AttributeType": "S"}],
                    BillingMode="PAY_PER_REQUEST",
                )
                waiter = dynamodb.get_waiter('table_exists')
                waiter.wait(TableName=TABLE_NAME)
                logger.info("DynamoDB table %s created.", TABLE_NAME)
            except Exception as create_err:
                logger.warning("Could not create DynamoDB table: %s. Using in-memory store.", create_err)
                _use_memory = True
        else:
            logger.warning(
                "Could not connect to DynamoDB (%s). Falling back to in-memory store.",
                type(e).__name__
            )
            _use_memory = True
    
    
    try:
        dynamodb = boto3.client("dynamodb", region_name=AWS_REGION)
        dynamodb.describe_table(TableName=SESSION_TABLE_NAME)
        logger.info("DynamoDB session table %s exists.", SESSION_TABLE_NAME)
    except (NoCredentialsError, Exception) as e:
        if isinstance(e, ClientError) and e.response['Error']['Code'] == 'ResourceNotFoundException':
            try:
                logger.info("Creating DynamoDB session table %s...", SESSION_TABLE_NAME)
                dynamodb = boto3.client("dynamodb", region_name=AWS_REGION)
                dynamodb.create_table(
                    TableName=SESSION_TABLE_NAME,
                    KeySchema=[{"AttributeName": "session_id", "KeyType": "HASH"}],
                    AttributeDefinitions=[{"AttributeName": "session_id", "AttributeType": "S"}],
                    BillingMode="PAY_PER_REQUEST",
                )
                waiter = dynamodb.get_waiter('table_exists')
                waiter.wait(TableName=SESSION_TABLE_NAME)
                logger.info("DynamoDB session table %s created.", SESSION_TABLE_NAME)
            except Exception as create_err:
                logger.warning("Could not create DynamoDB session table: %s. Using in-memory store.", create_err)
                _use_memory_sessions = True
        else:
            logger.warning(
                "Could not connect to DynamoDB for sessions (%s). Falling back to in-memory store.",
                type(e).__name__
            )
            _use_memory_sessions = True


def save_task(task: TaskResponse) -> None:
    if _use_memory:
        _memory_store[task.task_id] = task
        return
    table = get_table()
    if table is None:
        _memory_store[task.task_id] = task
        return
    try:
        table.put_item(
            Item={
                "task_id": task.task_id,
                "data": task.model_dump_json(),
            }
        )
    except Exception as e:
        logger.error("Failed to save task to DynamoDB: %s. Saving to memory.", e)
        _set_memory_mode()
        _memory_store[task.task_id] = task


def get_task(task_id: str) -> Optional[TaskResponse]:
    if _use_memory:
        return _memory_store.get(task_id)
    table = get_table()
    if table is None:
        return _memory_store.get(task_id)
    try:
        res = table.get_item(Key={"task_id": task_id})
        item = res.get("Item")
        if item and "data" in item:
            return TaskResponse.model_validate_json(item["data"])
    except ClientError as e:
        logger.error("Error fetching task %s: %s", task_id, e)
    return None


def list_tasks() -> list[TaskResponse]:
    if _use_memory:
        return list(_memory_store.values())
    table = get_table()
    if table is None:
        return list(_memory_store.values())
    try:
        res = table.scan()
        tasks = []
        for item in res.get("Items", []):
            if "data" in item:
                try:
                    tasks.append(TaskResponse.model_validate_json(item["data"]))
                except Exception:
                    pass
        return tasks
    except ClientError as e:
        logger.error("Error scanning tasks: %s", e)
        return []


def subscribe(task_id: str) -> asyncio.Queue:
    if task_id not in _streams:
        _streams[task_id] = []
    q = asyncio.Queue()
    _streams[task_id].append(q)
    return q


def unsubscribe(task_id: str, q: asyncio.Queue) -> None:
    if task_id in _streams:
        if q in _streams[task_id]:
            _streams[task_id].remove(q)
        if not _streams[task_id]:
            del _streams[task_id]


def publish_event(task_id: str, message: str) -> None:
    if task_id in _streams:
        for q in _streams[task_id]:
            loop = q._loop if hasattr(q, '_loop') else asyncio.get_event_loop()
            loop.call_soon_threadsafe(q.put_nowait, message)


def save_session(session: ChatSession) -> None:
    _session_store[session.session_id] = session
    if _use_memory_sessions:
        return
    table = get_session_table()
    if table is None:
        return
    try:
        session_dict = session.model_dump()
        session_dict['created_at'] = session.created_at.isoformat()
        for msg in session_dict.get('messages', []):
            msg['timestamp'] = msg['timestamp'] if isinstance(msg['timestamp'], str) else msg['timestamp'].isoformat()
        table.put_item(
            Item={
                "session_id": session.session_id,
                "data": json.dumps(session_dict),
            }
        )
    except Exception as e:
        logger.error("Failed to save session to DynamoDB: %s", e)


def get_session(session_id: str) -> Optional[ChatSession]:
    # Check memory first
    if session_id in _session_store:
        return _session_store[session_id]
    if _use_memory_sessions:
        return None
    table = get_session_table()
    if table is None:
        return None    
    try:
        res = table.get_item(Key={"session_id": session_id})
        item = res.get("Item")
        if item and "data" in item:
            session_dict = json.loads(item["data"])
            session = ChatSession.model_validate(session_dict)
            _session_store[session_id] = session
            return session
    except Exception as e:
        logger.error("Error fetching session %s: %s", session_id, e)
    return None


def list_sessions() -> list[ChatSession]:
    if _use_memory_sessions:
        return sorted(list(_session_store.values()), key=lambda x: x.created_at, reverse=True)
    table = get_session_table()
    if table is None:
        return sorted(list(_session_store.values()), key=lambda x: x.created_at, reverse=True)    
    try:
        res = table.scan()
        sessions = []
        for item in res.get("Items", []):
            if "data" in item:
                try:
                    session_dict = json.loads(item["data"])
                    session = ChatSession.model_validate(session_dict)
                    _session_store[session.session_id] = session
                    sessions.append(session)
                except Exception as e:
                    logger.error("Error parsing session: %s", e)
        return sorted(sessions, key=lambda x: x.created_at, reverse=True)
    except Exception as e:
        logger.error("Error scanning sessions: %s", e)
        return sorted(list(_session_store.values()), key=lambda x: x.created_at, reverse=True)


def delete_session(session_id: str) -> bool:
    if session_id in _session_store:
        del _session_store[session_id]
    if _use_memory_sessions:
        return True
    table = get_session_table()
    if table is None:
        return True    
    try:
        table.delete_item(Key={"session_id": session_id})
        return True
    except Exception as e:
        logger.error("Error deleting session %s: %s", session_id, e)
        return False


def add_message_to_session(session_id: str, message: ChatMessage) -> bool:
    session = get_session(session_id)
    if session:
        session.messages.append(message)
        save_session(session)
        return True
    return False