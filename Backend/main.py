from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from models import Staff,Shift,User
import schemas

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://restaurant-roster-planner.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@app.post("/login")
def login(data: dict):

    email = data["email"]
    password = data["password"]

    if email == "admin@gmail.com" and password == "admin123":
        return {
            "success": True,
            "message": "Login successful"
        }

    return {
        "success": False,
        "message": "Invalid email or password"
    }



@app.post("/register")
def register(user: dict, db: Session = Depends(get_db)):

    existing = db.query(User).filter(
        User.email == user["email"]
    ).first()

    if existing:
        return {
            "message":"Email already exists"
        }


    new_user = User(
        name=user["name"],
        email=user["email"],
        password=user["password"],
        role=user["role"]
    )


    db.add(new_user)
    db.commit()


    return {
        "message":"Account created successfully"
    }



@app.post("/login")
def login(data: dict, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == data["email"],
        User.password == data["password"]
    ).first()


    if user:
        return {
            "success":True,
            "name":user.name,
            "role":user.role
        }


    return {
        "success":False
    }


@app.get("/")
def home():
    return {"message": "Restaurant Staff Roster Planner API running"}


@app.get("/staff")
def get_staff(db: Session = Depends(get_db)):
    return db.query(Staff).all()


@app.post("/staff")
def create_staff(staff: dict, db: Session = Depends(get_db)):
    new_staff = Staff(
    name=staff["staff"]["name"],
    role=staff["staff"]["role"],
    email=staff["staff"]["email"],
    max_hours=staff["staff"]["max_hours"]
)


    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    return new_staff

@app.post("/shift")
def create_shift(shift: dict, db: Session = Depends(get_db)):
    new_shift = Shift(
    staff_id=shift["shift"]["staff_id"],
    day=shift["shift"]["day"],
    shift_slot=shift["shift"]["shift_slot"],
    hours=shift["shift"]["hours"]
)


    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift

@app.get("/shift")
def get_shifts(db: Session = Depends(get_db)):
    return db.query(Shift).all()


@app.delete("/staff/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()

    if staff:
        db.delete(staff)
        db.commit()
        return {"message": "Staff deleted successfully"}

    return {"message": "Staff not found"}


@app.delete("/shift/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db)):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()

    if shift:
        db.delete(shift)
        db.commit()
        return {"message": "Shift deleted successfully"}

    return {"message": "Shift not found"}


@app.put("/staff/{staff_id}")
def update_staff(staff_id: int, updated_staff: schemas.StaffCreate, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()

    if staff:
        staff.name = updated_staff.name
        staff.role = updated_staff.role
        staff.email = updated_staff.email
        staff.max_hours = updated_staff.max_hours

        db.commit()
        db.refresh(staff)
        return staff

    return {"message": "Staff not found"}