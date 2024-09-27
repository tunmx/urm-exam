import urm_simulation as urm
from urm_simulation import C, J, Z, S
from urm_dec import serialize_urm_program

# Define the sequence of instructions for the addition operation.
add_instruct = urm.Instructions(
    C(2, 0),
    Z(2),
    J(1, 2, 0),
    S(0),
    S(2),
    J(3, 3, 3),
)

# Define the function to perform addition using the URM simulator.
def add(x, y, safety_count=100):
    num_of_registers = urm.haddr(add_instruct) + 1
    registers = urm.allocate(num_of_registers)
    registers[1] = x
    registers[2] = y
    print(registers)
    result = urm.forward(None, registers, add_instruct, safety_count=safety_count)
    for i in result.ops_from_steps:
        print(i)
    wrapped_result = {}
    wrapped_result['registers_from_steps'] = []
    wrapped_result['ops_from_steps'] = []
    wrapped_result['serialized_program'] = serialize_urm_program(add_instruct, safety_count)
    for item in result.registers_from_steps:
        wrapped_result['registers_from_steps'].append(item.registers)
    for item in result.ops_from_steps:
        wrapped_result['ops_from_steps'].append(item)
        
    print(wrapped_result)
    return result.last_registers[0]

if __name__ == '__main__':
    x = 7
    y = 8
    z = add(x, y, safety_count=10)
    print(f'add({x}, {y}) = {z}')