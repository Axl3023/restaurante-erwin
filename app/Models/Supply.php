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

    protected $appends = ['is_alert'];

    public function getIsAlertAttribute(): bool
    {
        $min = (int) ($this->minimum_stock ?? 0);
        return $min > 0 && (int)$this->stock <= $min;
    }

    public function scopeInAlert($q)
    {
        return $q->where('minimum_stock', '>', 0)
                 ->whereColumn('stock', '<=', 'minimum_stock');
    }
    
    public function details()
    {
        return $this->hasMany(WarehouseEntryDetail::class, 'supply_id');
    }

}
