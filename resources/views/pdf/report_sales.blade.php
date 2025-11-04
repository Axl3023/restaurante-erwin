<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reporte de Ventas</title>
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
    h1 { font-size: 18px; margin: 0 0 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px; }
    th { background: #f0f0f0; text-transform: uppercase; font-size: 11px; }
    .right { text-align: right; }
    .muted { color: #666; }
  </style>
</head>
<body>
  <h1>Reporte de Ventas</h1>
  <div class="muted">
    Rango: {{ $filters['from'] }} al {{ $filters['to'] }} ·
    Agrupado por: {{ $filters['group'] === 'date' ? 'Fecha' : ($filters['group']==='table' ? 'Mesa' : 'Categoría') }}
  </div>

  <table>
    <thead>
      <tr>
        <th>{{ $filters['group'] === 'date' ? 'Fecha' : ($filters['group']==='table' ? 'Mesa' : 'Categoría') }}</th>
        <th class="right">Comp.</th>
        <th class="right">Subtotal</th>
        <th class="right">IGV</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      @forelse($rows as $r)
        <tr>
          <td>{{ $r->key_label }}</td>
          <td class="right">{{ number_format($r->sales_count, 0) }}</td>
          <td class="right">{{ number_format($r->subtotal, 2) }}</td>
          <td class="right">{{ number_format($r->tax, 2) }}</td>
          <td class="right"><strong>{{ number_format($r->total, 2) }}</strong></td>
        </tr>
      @empty
        <tr><td colspan="5" class="right">Sin resultados</td></tr>
      @endforelse
    </tbody>
    <tfoot>
      <tr>
        <th>Total</th>
        <th class="right">{{ number_format($summary['sales_count'], 0) }}</th>
        <th class="right">{{ number_format($summary['subtotal'], 2) }}</th>
        <th class="right">{{ number_format($summary['tax'], 2) }}</th>
        <th class="right">{{ number_format($summary['total'], 2) }}</th>
      </tr>
    </tfoot>
  </table>

  <h3 style="margin-top:18px;">Formas de pago</h3>
  <table>
    <thead>
      <tr>
        <th>Método</th>
        <th class="right">Importe</th>
      </tr>
    </thead>
    <tbody>
      @forelse($payments as $p)
        <tr>
          <td>{{ ucfirst($p->method) }}</td>
          <td class="right">{{ number_format($p->total, 2) }}</td>
        </tr>
      @empty
        <tr><td colspan="2" class="right">—</td></tr>
      @endforelse
    </tbody>
  </table>
</body>
</html>
