# Update the imports:
import mesop as me
from data_model import State, Models, ModelDialogState, Conversation, ChatMessage
from dialog import dialog, dialog_actions
#import claude
import gemini
from ricc_utils import read_file_to_string
from ricc_prompts import get_manual_prompt, substitute_prompt

STYLESHEETS = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
]

PROMPT_TITLES = {
    "RAG-time on Sheetless": "private/gegonos_sheetless_events",  # Empty value for now
    "RAG from Task Flow (coming)": 'private/advocacy_taskflow_open_bugs', # todo
    "RAG n' Richard from go/ricc-conferences": "private/trix_ricc_conferences",
}
EXAMPLES = [
    "Create a file-lock in Python",
    "Write an email to Congress to have free milk for all",
    "Make a nice box shadow in CSS",
]

@me.page(
    path="/",
    stylesheets=STYLESHEETS,
)
def home_page():
    model_picker_dialog()
    with me.box(style=ROOT_BOX_STYLE):
        header()
        with me.box(
            style=me.Style(
                width="min(680px, 100%)",
                margin=me.Margin.symmetric(horizontal="auto", vertical=36),
            )
        ):
            me.text(
                "Chat with multiple models at once",
                style=me.Style(font_size=20, margin=me.Margin(bottom=24)),
            )
            # Uncomment this in the next step:
            examples_row()
            me.text(
                "Ricc: unleash the power of RAGs to Richard!",
                style=me.Style(font_size=20, margin=me.Margin(bottom=24)),
            )
            prompts_row()
            chat_input()

@me.page(path="/conversation", stylesheets=STYLESHEETS)
def conversation_page():
    state = me.state(State)
    model_picker_dialog()
    with me.box(style=ROOT_BOX_STYLE):
        header()

        models = len(state.conversations)
        models_px = models * 680
        with me.box(
            style=me.Style(
                width=f"min({models_px}px, calc(100% - 32px))",
                display="grid",
                gap=16,
                grid_template_columns=f"repeat({models}, 1fr)",
                flex_grow=1,
                overflow_y="hidden",
                margin=me.Margin.symmetric(horizontal="auto"),
                padding=me.Padding.symmetric(horizontal=16),
            )
        ):
            for conversation in state.conversations:
                model = conversation.model
                messages = conversation.messages
                with me.box(
                    style=me.Style(
                        overflow_y="auto",
                    )
                ):
                    me.text("Model: " + model, style=me.Style(font_weight=500))

                    for message in messages:
                        if message.role == "user":
                            user_message(message.content)
                        else:
                            model_message(message)
                    if messages and model == state.conversations[-1].model:
                        me.box(
                            key="end_of_messages",
                            style=me.Style(
                                margin=me.Margin(
                                    bottom="50vh" if messages[-1].in_progress else 0
                                )
                            ),
                        )
        with me.box(
            style=me.Style(
                display="flex",
                justify_content="center",
            )
        ):
            with me.box(
                style=me.Style(
                    width="min(680px, 100%)",
                    padding=me.Padding(top=24, bottom=24),
                )
            ):
                chat_input()

def user_message(content: str):
    with me.box(
        style=me.Style(
            background="#e7f2ff",
            padding=me.Padding.all(16),
            margin=me.Margin.symmetric(vertical=16),
            border_radius=16,
        )
    ):
        me.text(content)

def model_message(message: ChatMessage):
    with me.box(
        style=me.Style(
            background="#fff",
            padding=me.Padding.all(16),
            border_radius=16,
            margin=me.Margin.symmetric(vertical=16),
        )
    ):
        me.markdown(message.content)
        if message.in_progress:
            me.progress_spinner()

# ... (keep the existing helper functions)


def change_model_option(e: me.CheckboxChangeEvent):
    s = me.state(ModelDialogState)
    if e.checked:
        s.selected_models.append(e.key)
    else:
        s.selected_models.remove(e.key)

def set_gemini_api_key(e: me.InputBlurEvent):
    me.state(State).gemini_api_key = e.value
def set_ldap(e: me.InputBlurEvent):
    me.state(State).ldap = e.value

# def set_claude_api_key(e: me.InputBlurEvent):
#     me.state(State).claude_api_key = e.value

def examples_row():
    with me.box(
        style=me.Style(
            display="flex", flex_direction="row", gap=16, margin=me.Margin(bottom=24)
        )
    ):
        for x in EXAMPLES:
            example(x)

def prompts_row():
    with me.box(
        style=me.Style(
            display="flex", flex_direction="row", gap=8, margin=me.Margin(bottom=12)
        )
    ):
        for k,v in PROMPT_TITLES.items():
            ricc_prompt(k, v)

def ricc_auto_smart_prompt( prompt_link: str):
    filename = prompt_link + ".manual.prompt"
    file_content = read_file_to_string(filename)
    print(file_content)
    return file_content


def ricc_prompt(text: str, prompt_link: str):
    with me.box(
        key=text,
        on_click=click_ricc_prompt,
        style=me.Style(
            cursor="pointer",
            background="teal",
            width="215px",
            height=160,
            font_weight=500,
            line_height="1.5",
            padding=me.Padding.all(16),
            border_radius=16,
            border=me.Border.all(me.BorderSide(width=1, color="blue", style="none")),
        ),
    ):
        me.text(f"💻 {text}" )
        #me.text(ricc_auto_smart_prompt(prompt_link))

def example(text: str):
    with me.box(
        key=text,
        on_click=click_example,
        style=me.Style(
            cursor="pointer",
            background="#b9e1ff",
            width="215px",
            height=160,
            font_weight=500,
            line_height="1.5",
            padding=me.Padding.all(16),
            border_radius=16,
            border=me.Border.all(me.BorderSide(width=1, color="blue", style="none")),
        ),
    ):
        me.text(text)

def click_example(e: me.ClickEvent):
    print(f"We clicked the blue example button.  e.key={ e.key}")
    state = me.state(State)
    state.input        = "(click_example1)" + e.key
    state.input_ricc_prompt = "(click_example3) meh"
    state.either_input = "(click_example2)" + e.key

def click_ricc_prompt(e: me.ClickEvent):
    rag_value = PROMPT_TITLES[e.key]
    #big_prompt = get_manual_prompt(rag_value)
    big_prompt = substitute_prompt(f"{rag_value}.prompt", ldap, f"{rag_value}.csv")
    print(f"We clicked the Riccardo Teal RAG button. e.key={e.key}. RAG Value is in fact: {rag_value}")
    print(f"Big Prompt: {big_prompt}")
    state = me.state(State)
    state.input_ricc_prompt = "(click_ricc_prompt1)" + e.key
    state.either_input      = "(click_ricc_prompt2)" + e.key
    state.input = "(click_ricc_prompt3)" + rag_value
    state.big_prompt = big_prompt


def model_picker_dialog():
    state = me.state(State)
    with dialog(state.is_model_picker_dialog_open):
        with me.box(style=me.Style(display="flex", flex_direction="column", gap=12)):
            me.text("API keys (not needed)")
            me.input(
                label="Gemini API Key",
                value=state.gemini_api_key,
                on_blur=set_gemini_api_key,
            )
            me.input(
                label="Your ldap (ie Googler username)",
                value=state.ldap,
                on_blur=set_ldap,
            )
            # me.input(
            #     label="Claude API Key",
            #     value=state.claude_api_key,
            #     on_blur=set_claude_api_key,
            # )
        me.text("Pick a model")
        for model in Models:
            if model.name.startswith("GEMINI"):
                disabled = not state.gemini_api_key
            elif model.name.startswith("CLAUDE"):
                disabled = True # not state.claude_api_key
            else:
                disabled = False
            me.checkbox(
                key=model.value,
                label=model.value,
                checked=model.value in state.models,
                disabled=disabled,
                on_change=change_model_option,
                style=me.Style(
                    display="flex",
                    flex_direction="column",
                    gap=4,
                    padding=me.Padding(top=12),
                ),
            )
        with dialog_actions():
            me.button("Cancel", on_click=close_model_picker_dialog)
            me.button("Confirm", on_click=confirm_model_picker_dialog)

def close_model_picker_dialog(e: me.ClickEvent):
    state = me.state(State)
    state.is_model_picker_dialog_open = False

def confirm_model_picker_dialog(e: me.ClickEvent):
    dialog_state = me.state(ModelDialogState)
    state = me.state(State)
    state.is_model_picker_dialog_open = False
    state.models = dialog_state.selected_models

ROOT_BOX_STYLE = me.Style(
    background="#e7f2ff",
    height="100%",
    font_family="Inter",
    display="flex",
    flex_direction="column",
)

def header():
    def navigate_home(e: me.ClickEvent):
        me.navigate("/")
        state = me.state(State)
        state.conversations = []

    with me.box(
        on_click=navigate_home,
        style=me.Style(
            cursor="pointer",
            padding=me.Padding.all(16),
        ),
    ):
        # me.text(
        #     "DuoChat",
        #     style=me.Style(
        #         font_weight=500,
        #         font_size=24,
        #         color="#3D3929",
        #         letter_spacing="0.3px",
        #     ),
        # )
        me.text(
            #https://google.github.io/mesop/codelab/5/
            "Mesop Gegonos Chat  (demo1-4, Pt5 to be reconciled)",
            style=me.Style(
                font_weight=500,
                font_size=24,
                color="#3D3929",
                letter_spacing="0.3px",
            ),
        )
        multiline_sub_heading = """Your favourite Sheetless and Trix and Taskflow helper.. works on CSV of
             [1] Sheetless export (-> dremelled -> csv),
             [2] Manual Trix (-> exported as CSV - TODO connected directly),
             [3] TaskFlow export (-> dremelled -> csv),

             More info: go/gegonos"""
        for line in multiline_sub_heading.split("\n"):
            me.text(line,
            style=me.Style(
                font_weight=200,
                font_size=18,
                color="teal",
                letter_spacing="0.3px",
            ),
        )

def header_old():
    with me.box(
        style=me.Style(
            padding=me.Padding.all(16),
        ),
    ):
        me.text(
            #https://google.github.io/mesop/codelab/5/
            "Mesop Gegonos Chat  (demo1-4, Pt5 to be reconciled)",
            style=me.Style(
                font_weight=500,
                font_size=24,
                color="#3D3929",
                letter_spacing="0.3px",
            ),
        )
        multiline_sub_heading = """Your favourite Sheetless and Trix and Taskflow helper.. works on CSV of
            [1] Sheetless export (-> dremelled -> csv),
            [2] Manual Trix (-> exported as CSV - TODO connected directly),
            [3] TaskFlow export (-> dremelled -> csv),

            More info: go/gegonos"""


        for line in multiline_sub_heading.split("\n"):
            me.text(line,
            style=me.Style(
                font_weight=200,
                font_size=18,
                color="teal",
                letter_spacing="0.3px",
            ),
        )


# Non capisco cosa faccia..
def on_blur(e: me.InputBlurEvent):
    '''Ricc: not sure what this does! TBD'''
    state = me.state(State)
    print("[ON BLUR] We clicked ")
    #state.input = e.value + " {blur}"
    #state.input_ricc_prompt = e.value + " {oasis}"
    state.input_either = e.value + " {suede}"


def switch_model(e: me.ClickEvent):
    state = me.state(State)
    state.is_model_picker_dialog_open = True
    dialog_state = me.state(ModelDialogState)
    dialog_state.selected_models = state.models[:]


def chat_input():
    state = me.state(State)
    with me.box(
        style=me.Style(
            border_radius=16,
            padding=me.Padding.all(8),
            background="white",
            display="flex",
            width="100%",
        )
    ):
        with me.box(style=me.Style(flex_grow=1)):
            me.native_textarea(
                # TODO should be EITHER
                value=state.input_either, # input_ricc_prompt,
                placeholder="Enter a prompt for trivial queries",
                on_blur=on_blur,
                style=me.Style(
                    padding=me.Padding(top=16, left=16),
                    outline="none",
                    width="100%",
                    border=me.Border.all(me.BorderSide(style="none")),
                ),
            )
            with me.box(
                style=me.Style(
                    display="flex",
                    padding=me.Padding(left=12, bottom=12),
                    cursor="pointer",
                ),
                on_click=switch_model,
            ):
                me.text(
                    "Model:",
                    style=me.Style(font_weight=500, padding=me.Padding(right=6)),
                )
                if state.models:
                    me.text(", ".join(state.models))
                else:
                    me.text("(no model selected)")
        with me.content_button(
            type="icon", on_click=send_prompt, disabled=not state.models
        ):
            me.icon("send")


# # Replace page() with this:
# @me.page(
#     path="/",
#     stylesheets=STYLESHEETS,
# )
# def conversation_page():
#     state = me.state(State)
#     model_picker_dialog()
#     with me.box(style=ROOT_BOX_STYLE):
#         header()

#         models = len(state.conversations)
#         models_px = models * 680
#         with me.box(
#             style=me.Style(
#                 width=f"min({models_px}px, calc(100% - 32px))",
#                 display="grid",
#                 gap=16,
#                 grid_template_columns=f"repeat({models}, 1fr)",
#                 flex_grow=1,
#                 overflow_y="hidden",
#                 margin=me.Margin.symmetric(horizontal="auto"),
#                 padding=me.Padding.symmetric(horizontal=16),
#             )
#         ):
#             for conversation in state.conversations:
#                 model = conversation.model
#                 messages = conversation.messages
#                 with me.box(
#                     style=me.Style(
#                         overflow_y="auto",
#                     )
#                 ):
#                     me.text("Model: " + model, style=me.Style(font_weight=500))

#                     for message in messages:
#                         if message.role == "user":
#                             user_message(message.content)
#                         else:
#                             model_message(message)
#                     if messages and model == state.conversations[-1].model:
#                         me.box(
#                             key="end_of_messages",
#                             style=me.Style(
#                                 margin=me.Margin(
#                                     bottom="50vh" if messages[-1].in_progress else 0
#                                 )
#                             ),
#                         )
#         with me.box(
#             style=me.Style(
#                 display="flex",
#                 justify_content="center",
#             )
#         ):
#             with me.box(
#                 style=me.Style(
#                     width="min(680px, 100%)",
#                     padding=me.Padding(top=24, bottom=24),
#                 )
#             ):
#                 chat_input()

# def user_message(content: str):
#     with me.box(
#         style=me.Style(
#             background="#e7f2ff",
#             padding=me.Padding.all(16),
#             margin=me.Margin.symmetric(vertical=16),
#             border_radius=16,
#         )
#     ):
#         me.text(content)

# def model_message(message: ChatMessage):
#     with me.box(
#         style=me.Style(
#             background="#fff",
#             padding=me.Padding.all(16),
#             border_radius=16,
#             margin=me.Margin.symmetric(vertical=16),
#         )
#     ):
#         me.markdown(message.content)
#         if message.in_progress:
#             me.progress_spinner()


# @me.page(
#     path="/",
#     stylesheets=STYLESHEETS,
# )
# def home_page():
#     model_picker_dialog()
#     with me.box(style=ROOT_BOX_STYLE):
#         header()
#         with me.box(
#             style=me.Style(
#                 width="min(680px, 100%)",
#                 margin=me.Margin.symmetric(horizontal="auto", vertical=36),
#             )
#         ):
#             me.text(
#                 "Chat with multiple models at once",
#                 style=me.Style(font_size=20, margin=me.Margin(bottom=24)),
#             )
#             # Uncomment this in the next step:
#             examples_row()
#             chat_input()

def page():
    model_picker_dialog()
    with me.box(style=ROOT_BOX_STYLE):
        header()
        with me.box(
            style=me.Style(
                width="min(680px, 100%)",
                margin=me.Margin.symmetric(horizontal="auto", vertical=36),
            )
        ):
            me.text(
                "Chat with multiple models at once",
                style=me.Style(font_size=20, margin=me.Margin(bottom=24)),
            )
            chat_input()
            display_conversations()

# Add display_conversations and display_message:
def display_conversations():
    state = me.state(State)
    for conversation in state.conversations:
        with me.box(style=me.Style(margin=me.Margin(bottom=24))):
            me.text(f"Model: {conversation.model}", style=me.Style(font_weight=500))
            for message in conversation.messages:
                display_message(message)

def display_message(message: ChatMessage):
    style = me.Style(
        padding=me.Padding.all(12),
        border_radius=8,
        margin=me.Margin(bottom=8),
    )
    if message.role == "user":
        style.background = "#e7f2ff"
    else:
        style.background = "#ffffff"

    with me.box(style=style):
        me.markdown(message.content)
        if message.in_progress:
            me.progress_spinner()


def send_prompt(e: me.ClickEvent):
    state = me.state(State)
    if not state.conversations:
        me.navigate("/conversation")
        for model in state.models:
            state.conversations.append(Conversation(model=model, messages=[]))
    # ok now we start
    #input = 'pre if'
    #input = f"[YESSSS Prompt] {state.input_ricc_prompt}"
    input = state.big_prompt
    state.big_prompt = '' # reset it then as its big
    if state.input_ricc_prompt:
        # This works, just doesnt visualize!

        state.input_ricc_prompt = ""
        state.input = ""
        state.input_either = input
        #state.input_either = ""
    else:
        input = f"[no Prompt sotrry] {state.input}"
        state.input_ricc_prompt = ""
        state.input = ""
        state.input_either = input
        #state.input_either = ""
# Original
#    input = state.input
#    state.input = ""

    for conversation in state.conversations:
        model = conversation.model
        messages = conversation.messages
        history = messages[:]
        messages.append(ChatMessage(role="user", content=input))
        messages.append(ChatMessage(role="model", in_progress=True))
        yield
        me.scroll_into_view(key="end_of_messages")
        if model == Models.GEMINI_1_5_FLASH.value:
            llm_response = gemini.send_prompt_flash(input, history)
        elif model == Models.GEMINI_1_5_PRO.value:
            llm_response = gemini.send_prompt_pro(input, history)
        elif model == Models.CLAUDE_3_5_SONNET.value:
            llm_response = claude.call_claude_sonnet(input, history)
        else:
            raise Exception("Unhandled model", model)
        for chunk in llm_response:
            messages[-1].content += chunk
            yield
        messages[-1].in_progress = False
        yield
