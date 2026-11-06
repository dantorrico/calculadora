
from decimal import Decimal, InvalidOperation, localcontext
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
app.json.sort_keys = False
MAX_DIGITS = 100


def calculate(left, operator, right=None):
    if isinstance(left, bool) or isinstance(right, bool):
        raise ValueError("Los operandos deben ser números.")

    try:
        a = Decimal(str(left))
        b = Decimal(str(right)) if operator != "sqrt" else None
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Los operandos deben ser números válidos.")

    if not a.is_finite() or (b is not None and not b.is_finite()):
        raise ValueError("Solo se permiten números finitos.")

    if len(a.as_tuple().digits) > MAX_DIGITS or (
        b is not None and len(b.as_tuple().digits) > MAX_DIGITS
    ):
        raise ValueError("Número demasiado largo.")

    if operator == "sqrt":
        if a < 0:
            raise ValueError(
                "No existe raíz cuadrada real de un número negativo."
            )
        with localcontext() as ctx:
            ctx.prec = 40
            result = a.sqrt()

    elif operator == "+":
        result = a + b

    elif operator == "-":
        result = a - b

    elif operator == "*":
        result = a * b

    elif operator == "/":
        if b == 0:
            raise ValueError("No se puede dividir entre cero.")
        result = a / b

    else:
        raise ValueError("Operación no admitida.")

    if not result.is_finite():
        raise ValueError("Resultado no válido.")

    formatted = format(result, "f")

    if "." in formatted:
        formatted = formatted.rstrip("0").rstrip(".")

    return "0" if formatted in ("-0", "") else formatted


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/health")
def health():
    return jsonify(status="ok", service="calculadora-clasica")


@app.post("/api/calculate")
def api_calculate():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify(error="Envía un objeto JSON válido."), 400

    if not all(key in payload for key in ("a", "operator")):
        return jsonify(error="Faltan campos: a, operator."), 400

    if payload["operator"] != "sqrt" and "b" not in payload:
        return jsonify(error="Falta el campo b."), 400

    try:
        result = calculate(
            payload["a"],
            payload["operator"],
            payload.get("b")
        )
    except ValueError as exc:
        return jsonify(error=str(exc)), 400

    return jsonify(result=result)


if __name__ == "__main__":
    app.run(debug=True)
