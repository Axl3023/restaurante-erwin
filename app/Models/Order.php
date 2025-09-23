<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'table_id', 'total', 'status'];

    protected $casts = [
        'total' => 'float',
    ];

    // Un pedido pertenece a un mesero (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Un pedido pertenece a una mesa
    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    // Un pedido tiene muchos productos
    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot('quantity', 'price')->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function sale()
    {
        return $this->hasOne(Sale::class);
    }
}
