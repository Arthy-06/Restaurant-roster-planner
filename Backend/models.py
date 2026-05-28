from sqlalchemy import Column, Integer, String
from database import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    email = Column(String)
    max_hours = Column(Integer)


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer)
    day = Column(String)
    shift_slot = Column(String)