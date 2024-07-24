import json
import traceback
from fastapi import FastAPI, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
import random
from datetime import datetime
from typing import List
from starlette.middleware.cors import CORSMiddleware
from connection import session
from histories import HistoryTable, HistoryBase


app = FastAPI(docs_url=None, redoc_url=None)
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"),name="static")




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

order = []
init = True
idx = 0
def initialize():
    global init, idx, order
    init = True
    idx = 0
    order = []

def get_random_history(idx):
    global init
    try:
        if init:
            num_histories = session.query(func.count(HistoryTable.id)).scalar()
            if num_histories == 0:
                raise Exception("No histories found in the table")
            order.extend(random.sample(range(1, num_histories + 1), num_histories))
            print(order)
            init = False
            data = session.query(HistoryTable).filter(HistoryTable.id == order[idx]).first()
            return data, order[idx]
        else:
            if idx == len(order):
                return {'error': 'No more histories available'}, None
            data = session.query(HistoryTable).filter(HistoryTable.id == order[idx]).first()
            return data, order[idx]
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()

@app.get("/histories")
def read_histories():
    histories = session.query(HistoryTable).all()
    return histories

@app.get("/histories/{history_id}")
def read_history(history_id: int):
    history = session.query(HistoryTable).filter(HistoryTable.id == history_id).first()
    return history


@app.post("/history")
async def create_history(name:str,year:int,img:str,url:str,catalog:str):
    db_history = HistoryTable()
    db_history.nameofcase = name
    db_history.yearofcase = year
    db_history.img = img
    db_history.namu_url = url
    db_history.catalog = catalog
    session.add(db_history)
    session.commit()
    return f"{db_history.nameofcase} created..."

@app.put("/histories")
async def update_histories(histories: List[HistoryBase]):
    for history in histories:
        db_history = session.query(HistoryTable).filter(HistoryTable.id == history.id).first()
        for key, value in history.dict().items():
            setattr(db_history, key, value)
        session.commit()
    return f"{histories[0].nameofcase} updated..."

@app.delete("/history/{history_id}")
async def delete_history(history_id: int):
    session.query(HistoryTable).filter(HistoryTable.id == history_id).delete()
    session.commit()
    return f"History deleted..."

@app.get("/statics")
async def get_statistics():
    categories = ["한국사", "세계사", "과학", "인물", "예술"]
    stats = {}
    try:
        for category in categories:
            count = session.query(func.count(HistoryTable.id)).filter(HistoryTable.catalog == category).scalar()
            stats[category] = count
        return stats
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@app.get("/img")
async def image():
    global idx
    try:
        result,resultindex = get_random_history(idx)
        idx+=1
        if result:
            return [result,resultindex]
        else:
            return [{"error": "No more videos available"},0]
    except Exception as e:
        print('Exception occurred:', str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500,detail=str(e))
    

@app.get("/date")
async def date(request: Request):
    global order
    try:
        resultindex = int(request.query_params.get('index'))
        tmpdata = session.query(HistoryTable).filter(HistoryTable.id == resultindex).first()
        
        return [tmpdata.yearofcase ,tmpdata.namu_url]
    except Exception as e:
        client_ip = request.client.host
        print(f"An error occurred with client IP: {client_ip}")
        print("Traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500,detail=str(e))
    

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})

@app.get("/game")
async def game(request: Request):
    global index, score
    index = 0
    score = 0
    try:
        initialize()
        return templates.TemplateResponse("game.html", {"request": request})
    except Exception as e:
        if hasattr(e, "message"):
            raise HTTPException(
                status_code=e.message["response"]["Error"]["Code"],
                detail=e.message["response"]["Error"]["Message"],
            )
        else:
            raise HTTPException(status_code=500, detail=str(e))
@app.get("/blog")
async def blog(request: Request):
    return templates.TemplateResponse("blog.html",{"request":request})