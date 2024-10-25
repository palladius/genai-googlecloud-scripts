from datetime import datetime
from vertexai.generative_models import (
#    Content,
    FunctionDeclaration,
    # GenerativeModel,
    # GenerationConfig,
    # Part,
    # Tool,
)


def ricc_datetime():
    """Tells you what day and time it is."""
    # todo add weekday datetime.now().strftime('%A')
    dt = datetime.now()
    dow = datetime.now().strftime('%A')
    return f"{dow}, {dt}" #  datetime.now().__str__()



get_datetime_func = FunctionDeclaration(
    name="ricc_datetime",
    description="Provide the current date and time, in REAL TIME!",
    parameters={
        "type": "object",
        "properties": {
        },
        "required": [
        ]
    },
)
