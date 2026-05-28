from pydantic import BaseModel


class StaffCreate(BaseModel):
    name: str
    role: str
    email: str
    max_hours: int


class ShiftCreate(BaseModel):
    staff_id: int
    day: str
    shift_slot: str
    hours: int