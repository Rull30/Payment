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
        Schema::create('invoice_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->integer('installment_number');
            $table->integer('total_installments');
            $table->decimal('amount', 12, 2);
            $table->date('due_date')->index();
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending')->index();
            $table->timestamp('reminder_sent_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_installments');
    }
};
