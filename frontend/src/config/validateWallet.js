
const walletValidate = (amount, description) => {
    let Errors = {};
    if (!amount) Errors.amount = 'Amount is required'
    if (isNaN(amount)) Errors.amount = 'Amount want to be number'
    if (!description.length > 100) Errors.description = 'Make description shorter';

    return Errors
}

export { walletValidate }