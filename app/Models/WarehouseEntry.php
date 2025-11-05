<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class WarehouseEntry extends Model
{
    use HasFactory;

    protected $table = 'warehouse_entries';
    protected $guarded = [];
    protected $dates = ['entry_date', 'created_at', 'updated_at'];
    protected $appends = ['total'];

    protected $casts = [
        'entry_date' => 'date',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function details()
    {
        return $this->hasMany(WarehouseEntryDetail::class);
    }

    // total = Σ (quantity * unit_price)
    protected function total(): Attribute
    {
        return Attribute::get(function () {
            return $this->details->sum(fn($d) => (float)$d->quantity * (float)$d->unit_price);
        });
    }
}
