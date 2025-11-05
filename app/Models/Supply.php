<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supply extends Model
{
    use HasFactory;

    protected $table = 'supplies';
    protected $guarded = [];
    protected $casts = [
        'stock' => 'int',
        'unit_price' => 'decimal:2',
    ];

    public function details()
    {
        return $this->hasMany(WarehouseEntryDetail::class, 'supply_id');
    }
}
