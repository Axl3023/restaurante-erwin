<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('warehouse_entry_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('warehouse_entry_id');
            $table->unsignedBigInteger('supply_id');
            $table->decimal('unit_price', 10, 2);
            $table->integer('quantity');
            $table->timestamps();
            // Foreign keys
            $table->foreign('warehouse_entry_id')->references('id')->on('warehouse_entries')->onDelete('cascade');
            $table->foreign('supply_id')->references('id')->on('supplies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_entry_details');
    }
};
