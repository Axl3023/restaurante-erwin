<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ strtoupper($sale->type) }} {{ $sale->series }}-{{ $sale->number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; }
        .box { border:1px solid #ddd; padding:8px; margin-bottom:10px; }
        table { width:100%; border-collapse: collapse; }
        th, td { border-bottom:1px solid #eee; padding:6px; text-align:left; }
        th { background:#f5f5f5; }
        .right { text-align:right; }
        .totals td { border:none; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h2 style="margin:0;">Mi Restaurante</h2>
            <div>RUC 20123456789</div>
            <div>Av. Principal 123 - Lima</div>
        </div>
        <div style="text-align:right;">
            <h3 style="margin:0;">{{ strtoupper($sale->type) }}</h3>
            <div>{{ $sale->series }}-{{ $sale->number }}</div>
            <div>Emitido: {{ optional($sale->issued_at)->format('d/m/Y H:i') }}</div>
        </div>
    </div>

    <div class="box">
        <strong>Cliente</strong><br>
        @if($sale->customer)
            {{ $sale->customer->name }}<br>
            {{ $sale->customer->doc_type }} {{ $sale->customer->doc_number }}<br>
            @if($sale->customer->address) {{ $sale->customer->address }}<br>@endif
            @if($sale->customer->email)   {{ $sale->customer->email }}<br>@endif
        @else
            Consumidor Final
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th class="right">Cant</th>
                <th class="right">P. Unit</th>
                <th class="right">Total</th>
            </tr>
        </thead>
        <tbody>
        @foreach($sale->order->products as $p)
            <tr>
                <td>{{ $p->name }}</td>
                <td class="right">{{ (int)$p->pivot->quantity }}</td>
                <td class="right">S/ {{ number_format($p->pivot->price, 2) }}</td>
                <td class="right">S/ {{ number_format($p->pivot->price * $p->pivot->quantity, 2) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <table class="totals" style="margin-top:10px;">
        <tr>
            <td class="right" style="width:80%"><strong>Subtotal</strong></td>
            <td class="right" style="width:20%">S/ {{ number_format($sale->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td class="right"><strong>IGV (18%)</strong></td>
            <td class="right">S/ {{ number_format($sale->tax, 2) }}</td>
        </tr>
        <tr>
            <td class="right"><strong>Total</strong></td>
            <td class="right"><strong>S/ {{ number_format($sale->total, 2) }}</strong></td>
        </tr>
    </table>

    <div style="margin-top:20px; font-size:11px; color:#555;">
        Atendido por: {{ optional($sale->order->user)->name }} |
        Mesa: {{ optional($sale->order->table)->name }}
    </div>
</body>
</html>
