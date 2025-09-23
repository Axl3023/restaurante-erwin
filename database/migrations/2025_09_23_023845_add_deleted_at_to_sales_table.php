<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/xxxx_xx_xx_xxxxxx_add_deleted_at_to_sales_table.php

return new class extends Migration {
    public function up(): void {
        Schema::table('sales', function (Blueprint $table) {
            $table->softDeletes(); // crea 'deleted_at'
        });
    }

    public function down(): void {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
