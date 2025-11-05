<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WarehouseEntryDetail extends Model
{
    use HasFactory;

    protected $table = 'warehouse_entry_details';
    protected $guarded = [];
    protected $casts = [
        'quantity' => 'int',
        'unit_price' => 'decimal:2',
    ];

    public function entry()
    {
        return $this->belongsTo(WarehouseEntry::class, 'warehouse_entry_id');
    }

    public function supply()
    {
        return $this->belongsTo(Supply::class, 'supply_id');
    }
}
