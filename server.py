from fastapi import FastAPI
from fastapi.responses import Response
import uvicorn
import urm_simulation as urm
from urm_simulation import C, J, Z, S
from urm_dec import build_urm_program_from_data, serialize_urm_program
import json
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

STATIC_DIR = "urm-visualization/build_latest"
# STATIC_DIR = "urm-visualization/build"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=f"{STATIC_DIR}/static"), name="static")

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/get_max_register")
async def get_haddr(request: Request):
    try:
        data = await request.json()
        urm_program, _ = build_urm_program_from_data(data)
        return {"haddr": urm.haddr(urm_program) + 1}
    except Exception as e:
        return {"error": str(e)}

@app.post("/run_urm_program")
async def run_urm_program(request: Request):
    try:
        data = await request.json()
        print(f"Data: {data}")
        urm_program, safety_count = build_urm_program_from_data(data['program'])
        initialization_registers = data['initialRegisters']
        initialization_registers = urm.Registers(initialization_registers)
        print(urm_program)
        result = urm.forward(None, initialization_registers, urm_program, safety_count=safety_count)
        wrapped_result = {}
        wrapped_result['registers_from_steps'] = []
        wrapped_result['ops_from_steps'] = []
        wrapped_result['serialized_program'] = serialize_urm_program(urm_program, safety_count=safety_count)
        for item in result.registers_from_steps:
            wrapped_result['registers_from_steps'].append(item.registers)
        for item in result.ops_from_steps:
            wrapped_result['ops_from_steps'].append(item)
        print(wrapped_result)
        return {"result": wrapped_result}
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

@app.get("/index")
async def serve_react_app(request: Request):
    return HTMLResponse(content=open(f"{STATIC_DIR}/index.html", "r").read())

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8975, reload=True)