import React, { useState, useEffect } from "react";

function App() {
  const [staff, setStaff] = useState({
    name: "",
    role: "",
    email: "",
    max_hours: ""
  });

  const [shift, setShift] = useState({
    staff_id: "",
    day: "",
    shift_slot: "",
    hours: ""
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
  localStorage.getItem("loggedIn") === "true"
);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [staffList, setStaffList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const SHIFT_HOURS = {
    Morning: 8,
    Afternoon: 8,
    Evening: 8,
    Night: 8
  };

  const fetchStaff = async () => {
    const response = await fetch("https://restaurant-roster-planner.onrender.com/staff");
    const data = await response.json();
    setStaffList(data);
  };

  const fetchShifts = async () => {
    const response = await fetch("https://restaurant-roster-planner.onrender.com/shift");
    const data = await response.json();
    setShiftList(data);
  };

  useEffect(() => {
    fetchStaff();
    fetchShifts();
  }, []);

  const handleStaffChange = (e) => {
    setStaff({
      ...staff,
      [e.target.name]: e.target.value
    });
  };

  const handleShiftChange = (e) => {
    setShift({
      ...shift,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  const response = await fetch(
    "https://restaurant-roster-planner.onrender.com/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password
      })
    }
  );

  const data = await response.json();

  if (data.success) {
    alert("Login successful!");

    setIsLoggedIn(true);
    localStorage.setItem("loggedIn", "true");

  } else {
    alert("Invalid email or password");
  }
};

  const handleStaffSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `https://restaurant-roster-planner.onrender.com/staff/${editingId}`
      : "https://restaurant-roster-planner.onrender.com/staff";

    const method = editingId ? "PUT" : "POST";

    const bodyData = editingId
      ? {
          name: staff.name,
          role: staff.role,
          email: staff.email,
          max_hours: Number(staff.max_hours)
        }
      : {
          staff: {
            name: staff.name,
            role: staff.role,
            email: staff.email,
            max_hours: Number(staff.max_hours)
          }
        };

    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    alert(
      editingId
        ? "Staff updated successfully!"
        : "Staff added successfully!"
    );

    setStaff({
      name: "",
      role: "",
      email: "",
      max_hours: ""
    });

    setEditingId(null);

    fetchStaff();
  };

  const handleShiftSubmit = async (e) => {
    e.preventDefault();

    const selectedStaff = staffList.find(
      (member) => member.id === Number(shift.staff_id)
    );

    if (!selectedStaff) {
      alert("Please select a valid staff member");
      return;
    }

    const alreadyAssigned = shiftList.find(
      (item) =>
        item.staff_id === Number(shift.staff_id) &&
        item.day === shift.day &&
        item.shift_slot === shift.shift_slot
    );

    if (alreadyAssigned) {
      alert("This shift is already assigned!");
      return;
    }

    const totalAssignedHours = shiftList
      .filter((item) => item.staff_id === Number(shift.staff_id))
      .reduce((total, item) => total + Number(item.hours || 0), 0);

    if (
      totalAssignedHours + SHIFT_HOURS[shift.shift_slot] >
      selectedStaff.max_hours
    ) {
      alert("Maximum work hours exceeded!");
      return;
    }
    await fetch("https://restaurant-roster-planner.onrender.com/shift", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    shift: {
      staff_id: Number(shift.staff_id),
      day: shift.day,
      shift_slot: shift.shift_slot,
      hours: Number(SHIFT_HOURS[shift.shift_slot])
    }
  })
});
   
  

    alert("Shift assigned successfully!");

    setShift({
      staff_id: "",
      day: "",
      shift_slot: "",
      hours: ""
    });

    fetchShifts();
  };

  const deleteStaff = async (id) => {
    await fetch(`https://restaurant-roster-planner.onrender.com/staff/${id}`, {
      method: "DELETE"
    });

    fetchStaff();
  };

  const deleteShift = async (id) => {
    await fetch(`https://restaurant-roster-planner.onrender.com/shift/${id}`, {
      method: "DELETE"
    });

    fetchShifts();
  };

  const editStaff = (member) => {
    setStaff({
      name: member.name,
      role: member.role,
      email: member.email,
      max_hours: member.max_hours
    });

    setEditingId(member.id);
  };

  if (!isLoggedIn) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2>🔐 Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              onChange={handleLoginChange}
              style={inputStyle}
            />

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={handleLoginChange}
              style={inputStyle}
            />

            <button style={buttonStyle}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      <div style={headerStyle}>
        <h1 style={{ margin: 0 }}>
          🍽️ Restaurant Staff Roster Planner
        </h1>

        <p style={{ marginTop: "10px" }}>
          Smart scheduling for restaurant staff management
        </p>

        <h3>Welcome, Admin 👋</h3>

        <button
          onClick={() => {
  setIsLoggedIn(false);
  localStorage.removeItem("loggedIn");
}}
          style={{
            marginTop: "15px",
            padding: "10px 18px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#ff4d4f",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>

      {/* Dashboard Cards */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "25px"
        }}
      >
        <div
          style={{
            flex: 1,
            background: "white",
            padding: "20px",
            borderRadius: "18px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.12)",
            textAlign: "center"
          }}
        >
          <h2>👥 Total Staff</h2>
          <h1>{staffList.length}</h1>
        </div>

        <div
          style={{
            flex: 1,
            background: "white",
            padding: "20px",
            borderRadius: "18px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.12)",
            textAlign: "center"
          }}
        >
          <h2>📅 Total Shifts</h2>
          <h1>{shiftList.length}</h1>
        </div>
      </div>

      {/* Forms Section */}

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h2>👨‍🍳 Add Staff</h2>

          <form onSubmit={handleStaffSubmit}>
            <input
              name="name"
              placeholder="Full Name"
              value={staff.name}
              onChange={handleStaffChange}
              style={inputStyle}
            />

            <input
              name="role"
              placeholder="Role"
              value={staff.role}
              onChange={handleStaffChange}
              style={inputStyle}
            />

            <input
              name="email"
              placeholder="Email"
              value={staff.email}
              onChange={handleStaffChange}
              style={inputStyle}
            />

            <input
              name="max_hours"
              placeholder="Max Hours"
              value={staff.max_hours}
              onChange={handleStaffChange}
              style={inputStyle}
            />

            <button style={buttonStyle}>
              {editingId ? "Update Staff" : "➕ Add Staff"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2>📅 Assign Shift</h2>

          <form onSubmit={handleShiftSubmit}>
            <select
              name="staff_id"
              value={shift.staff_id}
              onChange={handleShiftChange}
              style={inputStyle}
            >
              <option value="">Select Staff</option>

              {staffList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            <select
              name="day"
              value={shift.day}
              onChange={handleShiftChange}
              style={inputStyle}
            >
              <option value="">Select Day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>

            <select
              name="shift_slot"
              value={shift.shift_slot}
              onChange={handleShiftChange}
              style={inputStyle}
            >
              <option value="">Select Shift</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>

            <button style={buttonStyle}>
              ✅ Assign Shift
            </button>
          </form>
        </div>
      </div>

      {/* Staff and Shift Lists */}

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h2>👥 Staff List</h2>

          <input
            type="text"
            placeholder="🔍 Search by name or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          <ul style={listStyle}>
            {staffList
              .filter(
                (member) =>
                  member.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  member.role
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((member) => {
                const assignedHours = shiftList
                  .filter((item) => item.staff_id === member.id)
                  .reduce(
                    (total, item) => total + Number(item.hours || 0),
                    0
                  );

                return (
                  <li key={member.id} style={staffItemStyle}>
                    <div>
                      👤 <strong>{member.name}</strong> | {member.role}
                      <br />
                      Assigned Hours: {assignedHours} / {member.max_hours}
                    </div>

                    <div>
                      {assignedHours >= member.max_hours ? (
                        <span
                          style={{
                            color: "red",
                            fontWeight: "bold",
                            marginRight: "10px"
                          }}
                        >
                          ❌ Fully Booked
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "green",
                            fontWeight: "bold",
                            marginRight: "10px"
                          }}
                        >
                          ✅ Available
                        </span>
                      )}

                      <button
                        onClick={() => editStaff(member)}
                        style={editButtonStyle}
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => deleteStaff(member.id)}
                        style={deleteButtonStyle}
                      >
                        ❌
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>

        <div style={cardStyle}>
          <h2>🕒 Shift Schedule</h2>

          <ul style={listStyle}>
            {shiftList.map((item) => (
              <li key={item.id} style={shiftItemStyle}>
  <div>
    <strong>
      {
        staffList.find(
          (member) => member.id === item.staff_id
        )?.name
      }
    </strong>

    <br />



📅 {item.day} | ⏰ {item.shift_slot}

<br />

🕒 Shift Hours: {item.hours || SHIFT_HOURS[item.shift_slot]} hrs

<br />
   

    <br />

   📊 Total Assigned:
{
  shiftList
    .filter(
      (shift) =>
        Number(shift.staff_id) ===
        Number(item.staff_id)
    )
    .reduce(
      (total, shift) =>
        total +
        Number(
          shift.hours ||
          SHIFT_HOURS[shift.shift_slot]
        ),
      0
    )
} hrs
  </div>

  <button
    onClick={() => deleteShift(item.id)}
    style={deleteButtonStyle}
  >
    ❌
  </button>
</li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "30px",
  background: "linear-gradient(to right, #eef2f3, #d9e4f5)",
  fontFamily: "Segoe UI, sans-serif"
};

const headerStyle = {
  textAlign: "center",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "white",
  padding: "30px",
  borderRadius: "20px",
  marginBottom: "30px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "25px",
  marginBottom: "25px"
};

const cardStyle = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "18px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.12)"
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "15px"
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(to right, #36d1dc, #5b86e5)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
  fontWeight: "bold"
};

const listStyle = {
  listStyle: "none",
  padding: 0
};

const staffItemStyle = {
  background: "#f9fafc",
  marginBottom: "12px",
  padding: "15px",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)"
};

const deleteButtonStyle = {
  marginLeft: "8px",
  backgroundColor: "transparent",
  color: "#ff4d4f",
  border: "none",
  cursor: "pointer",
  fontSize: "18px"
};

const editButtonStyle = {
  marginLeft: "8px",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "18px"
};

const shiftItemStyle = {
  background: "linear-gradient(to right, #f6f9fc, #eef2ff)",
  marginBottom: "12px",
  padding: "12px",
  borderRadius: "12px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

export default App;