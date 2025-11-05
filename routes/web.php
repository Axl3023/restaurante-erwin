<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\SaleController as AdminSaleController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\POS\OrderController;
use App\Http\Controllers\POS\PosController;
use App\Http\Controllers\POS\TableController;
use App\Http\Controllers\Admin\SupplyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- Grupo de Rutas para Administradores ---
    Route::middleware(['role:Administrador'])->prefix('admin')->name('admin.')->group(function () {
        // Aquí irían reportes más avanzados, gestión de usuarios, etc.
        Route::resource('categories', CategoryController::class);
        Route::resource('products', ProductController::class);
        Route::resource('tables', TableController::class);
        Route::resource('orders', AdminOrderController::class);
        Route::resource('roles', RoleController::class)->except(['show']);
        Route::post('/orders/{order}/checkout', [AdminOrderController::class, 'checkout'])->name('orders.checkout');

        // Rutas adicionales para pedidos
        Route::patch('/orders/{order}/resolve', [AdminOrderController::class, 'resolve'])->name('orders.resolve');
        Route::patch('/orders/{order}/cancel', [AdminOrderController::class, 'cancel'])->name('orders.cancel');

        // Clientes (search y alta inline)
        Route::get('/customers/search', [AdminCustomerController::class, 'search'])->name('customers.search');
        Route::post('/customers', [AdminCustomerController::class, 'store'])->name('customers.store');

        // Ventas
        Route::get('/sales/{sale}', [AdminSaleController::class, 'show'])->name('sales.show');
        Route::get('/sales/{sale}/pdf', [AdminSaleController::class, 'pdf'])->name('sales.pdf');

        Route::resource('users', AdminUserController::class);
        Route::patch('users/{id}/restore', [AdminUserController::class, 'restore'])->name('users.restore');

        Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/sales/pdf', [ReportController::class, 'salesPdf'])->name('reports.sales.pdf');
        Route::get('/warehouse-entries',        [SupplyController::class, 'index'])->name('entries.index');
        Route::get('/warehouse-entries/create', [SupplyController::class, 'create'])->name('entries.create');
        Route::post('/warehouse-entries',       [SupplyController::class, 'store'])->name('entries.store');
        Route::get('/warehouse-entries/{warehouseEntry}/edit', [SupplyController::class, 'edit'])->name('entries.edit');
        Route::put('/warehouse-entries/{warehouseEntry}',      [SupplyController::class, 'update'])->name('entries.update');
        Route::delete('/warehouse-entries/{warehouseEntry}',   [SupplyController::class, 'destroy'])->name('entries.destroy');
    });

    // --- Grupo de Rutas para Punto de Venta (Meseros y Administradores) ---
    Route::middleware(['role:Administrador|Mesero'])->prefix('pos')->name('pos.')->group(function () {
        Route::get('/', [PosController::class, 'index'])->name('index');
        Route::resource('orders', OrderController::class);
        // Aquí podrías añadir rutas para gestionar mesas (cambiar estado, etc.)
        Route::patch('/tables/{table}/free', [TableController::class, 'freeUp'])->name('tables.free');
        Route::patch('/tables/{table}/free-with-resolution', [TableController::class, 'freeUpWithOrderResolution'])->name('tables.free-with-resolution');
        // Route::get('/orders/{table}/active', [OrderController::class, 'getActiveOrdersByTable'])->name('orders.table.active');
        // Route::patch('/orders/{order}/mark-as-paid', [OrderController::class, 'markAsPaid'])->name('orders.mark-as-paid');
        Route::get('/tables/{table}/profit-summary', [OrderController::class, 'getTableProfitSummary'])->name('tables.profit-summary');
    });

    // --- Grupo de Rutas para Cocina (Cocineros y Administradores) ---
    Route::middleware(['role:Administrador|Cocinero'])->prefix('kitchen')->name('kitchen.')->group(function () {
        // Route::get('/orders', [KitchenController::class, 'index'])->name('orders.index');
        // Implementación futura
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
