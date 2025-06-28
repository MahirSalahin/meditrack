import os
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "../templates")


def render_prescription_pdf(context: dict) -> bytes:
    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        autoescape=select_autoescape(["html", "xml"]),
    )
    template = env.get_template("prescription_template.html")
    html_content = template.render(**context)
    pdf = HTML(string=html_content).write_pdf()
    return pdf
