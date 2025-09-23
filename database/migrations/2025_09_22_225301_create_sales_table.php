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
        Schema::create('sales', function (Blueprint $table) {
            // Asegura InnoDB (normalmente ya es el default)
            $table->engine = 'InnoDB';

            $table->id();

            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();

            // boleta / factura
            $table->enum('receipt_type', ['boleta', 'factura'])->index();

            // ⚠️ Cambios clave:
            // - series a CHAR(4) (ej: B001 / F001)
            // - number a UNSIGNED INTEGER (guardas 1..n y lo paddeas a 8 para mostrar)
            $table->char('series', 4);
            $table->unsignedInteger('number');

            // Si prefieres string: $table->string('number', 12);  // también sirve

            $table->dateTime('issued_at')->nullable();

            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2);
            $table->decimal('total', 10, 2);

            $table->string('status', 20)->default('paid'); // o 'issued', como manejes estados
            $table->timestamps();

            // Ahora sí cabe dentro del límite de índices
            $table->unique(['series', 'number'], 'sales_series_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
