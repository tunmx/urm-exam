from urm_dec import build_urm_program_from_data, serialize_urm_program
import urm
from urm import C, J, Z, S
import json

if __name__ == "__main__":

    data = urm.Instructions(
    J(0, 1, 0),
    S(2, ),
    J(1, 2, 0),
    S(0),
    S(2),
    J(0, 0, 3)
    )
    name = "Pred"
    save_path = f"./programs/{name}.json"
    urm_program = serialize_urm_program(data, safety_count=1000)
    print(urm_program)
    with open(save_path, "w") as f:
        json.dump(urm_program, f, indent=4)
