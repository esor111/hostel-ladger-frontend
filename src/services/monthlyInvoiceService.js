// Monthly Invoice Service - Handles automated billing logic
export const monthlyInvoiceService = {
  
  // Calculate days in a month
  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  },

  // Get the next billing date after configuration
  getNextBillingDate(configurationDate) {
    const configDate = new Date(configurationDate);
    const nextDay = new Date(configDate);
    nextDay.setDate(configDate.getDate() + 1);
    
    // If configuration is done on the last day of month, billing starts next month
    if (nextDay.getMonth() !== configDate.getMonth()) {
      return new Date(nextDay.getFullYear(), nextDay.getMonth(), 1);
    }
    
    return nextDay;
  },

  // Calculate prorated amount for partial month (from configuration date)
  calculateProratedAmount(monthlyFee, configurationDate) {
    const configDate = new Date(configurationDate);
    const year = configDate.getFullYear();
    const month = configDate.getMonth();
    const daysInMonth = this.getDaysInMonth(year, month + 1);
    
    // Days remaining in the month (including configuration day)
    const daysRemaining = daysInMonth - configDate.getDate() + 1;
    const dailyRate = monthlyFee / daysInMonth;
    
    return {
      amount: Math.round(dailyRate * daysRemaining * 100) / 100,
      dailyRate: Math.round(dailyRate * 100) / 100,
      daysCharged: daysRemaining,
      daysInMonth: daysInMonth,
      period: `${configDate.toLocaleDateString()} to ${new Date(year, month + 1, 0).toLocaleDateString()}`
    };
  },

  // Calculate prorated amount for checkout (partial month)
  calculateCheckoutProration(monthlyFee, checkoutDate) {
    const checkoutDateObj = new Date(checkoutDate);
    const year = checkoutDateObj.getFullYear();
    const month = checkoutDateObj.getMonth();
    const daysInMonth = this.getDaysInMonth(year, month + 1);
    
    // Days stayed in the month (up to checkout date)
    const daysStayed = checkoutDateObj.getDate();
    const dailyRate = monthlyFee / daysInMonth;
    
    return {
      amount: Math.round(dailyRate * daysStayed * 100) / 100,
      dailyRate: Math.round(dailyRate * 100) / 100,
      daysCharged: daysStayed,
      daysInMonth: daysInMonth,
      period: `${new Date(year, month, 1).toLocaleDateString()} to ${checkoutDateObj.toLocaleDateString()}`
    };
  },

  // Generate unique invoice ID with BL-Year-Month-UniqueNumber format
  generateUniqueInvoiceId(billingDate) {
    const date = new Date(billingDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    const uniqueNumber = String(timestamp).slice(-6); // Last 6 digits for uniqueness
    
    return `BL-${year}-${month}-${uniqueNumber}`;
  },

  // Generate monthly invoice for a student
  async generateMonthlyInvoice(studentId, billingDate, monthlyFee, additionalCharges = []) {
    const billingDateObj = new Date(billingDate);
    const year = billingDateObj.getFullYear();
    const month = billingDateObj.getMonth();
    
    // Calculate total additional charges
    const additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const totalAmount = monthlyFee + additionalTotal;
    
    // Generate unique invoice ID
    const invoiceId = this.generateUniqueInvoiceId(billingDate);
    
    const invoice = {
      id: invoiceId,
      referenceId: invoiceId, // Use same ID as reference
      studentId: studentId,
      invoiceDate: billingDate,
      dueDate: new Date(year, month, 15).toISOString().split('T')[0], // Due on 15th of the month
      period: {
        from: new Date(year, month, 1).toLocaleDateString(),
        to: new Date(year, month + 1, 0).toLocaleDateString(),
        type: 'full_month'
      },
      charges: [
        {
          description: `Monthly Fee - ${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          amount: monthlyFee,
          type: 'monthly_fee'
        },
        ...additionalCharges.map(charge => ({
          description: charge.description,
          amount: charge.amount,
          type: 'additional_charge'
        }))
      ],
      totalAmount: totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      billingType: 'monthly'
    };

    console.log(`📧 Monthly Invoice Generated:`, invoice);
    return invoice;
  },

  // Generate prorated invoice for configuration
  async generateConfigurationInvoice(studentId, configurationDate, monthlyFee, additionalCharges = []) {
    const proratedCalc = this.calculateProratedAmount(monthlyFee, configurationDate);
    const additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const totalAmount = proratedCalc.amount + additionalTotal;
    
    // Generate unique invoice ID for configuration
    const invoiceId = this.generateUniqueInvoiceId(configurationDate);
    
    const invoice = {
      id: invoiceId,
      referenceId: invoiceId,
      studentId: studentId,
      invoiceDate: configurationDate,
      dueDate: new Date(new Date(configurationDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 7 days
      period: {
        from: new Date(configurationDate).toLocaleDateString(),
        to: proratedCalc.period.split(' to ')[1],
        type: 'prorated_configuration'
      },
      charges: [
        {
          description: `Prorated Monthly Fee (${proratedCalc.daysCharged} days @ NPR ${proratedCalc.dailyRate}/day)`,
          amount: proratedCalc.amount,
          type: 'prorated_fee',
          calculation: proratedCalc
        },
        ...additionalCharges.map(charge => ({
          description: charge.description,
          amount: charge.amount,
          type: 'additional_charge'
        }))
      ],
      totalAmount: totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      billingType: 'prorated_configuration'
    };

    console.log(`📧 Configuration Invoice Generated:`, invoice);
    return invoice;
  },

  // Main billing workflow
  async processBillingWorkflow(student, eventType, eventDate, additionalCharges = []) {
    const studentId = student.id;
    const monthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;
    
    switch (eventType) {
      case 'configuration':
        // Generate prorated invoice for remaining days in configuration month
        const configInvoice = await this.generateConfigurationInvoice(
          studentId, 
          eventDate, 
          monthlyFee, 
          additionalCharges
        );
        
        // Schedule next monthly invoice
        const nextBilling = this.scheduleNextMonthlyInvoice(studentId, eventDate);
        
        return {
          invoice: configInvoice,
          nextScheduled: nextBilling,
          message: `Configuration invoice generated. Next monthly billing: ${nextBilling.scheduledDate}`
        };
        
      case 'monthly':
        // Generate full monthly invoice
        const monthlyInvoice = await this.generateMonthlyInvoice(
          studentId, 
          eventDate, 
          monthlyFee, 
          additionalCharges
        );
        
        // Schedule next month
        const nextMonthly = this.scheduleNextMonthlyInvoice(studentId, eventDate);
        
        return {
          invoice: monthlyInvoice,
          nextScheduled: nextMonthly,
          message: `Monthly invoice generated. Next billing: ${nextMonthly.scheduledDate}`
        };
        
      default:
        throw new Error(`Unknown billing event type: ${eventType}`);
    }
  },

  // Schedule next monthly invoice
  scheduleNextMonthlyInvoice(studentId, currentDate) {
    const current = new Date(currentDate);
    const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    
    console.log(`📅 Next monthly invoice scheduled for ${studentId} on ${nextMonth.toLocaleDateString()}`);
    
    return {
      studentId: studentId,
      scheduledDate: nextMonth.toISOString().split('T')[0],
      type: 'monthly_invoice'
    };
  }
};