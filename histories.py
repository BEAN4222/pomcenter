# coding: utf-8
from sqlalchemy import Column, Integer, String
from pydantic import BaseModel
from connection import Base
from connection import ENGINE


class HistoryTable(Base):
    __tablename__ = 'histories'
    id = Column(Integer, primary_key=True, autoincrement=True)
    catalog = Column(String(32))
    nameofcase = Column(String(32), nullable=False)
    yearofcase = Column(Integer)
    img = Column(String(256))
    namu_url = Column(String(256))

class HistoryBase(BaseModel):
    id: int
    nameofcase: str
    yearofcase: int
    img: str
    namu_url: str
    catalog:str
    


def main():
    # Table 없으면 생성
    Base.metadata.create_all(bind=ENGINE)

if __name__ == "__main__":
    main()