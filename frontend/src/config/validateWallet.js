
const walletValidate = (amount, description) => {
    let Errors = {};
    if (!amount) Errors.amount = 'Amount is required'
    if (isNaN(amount)) Errors.amount = 'Amount want to be number'
    if (amount < 1) Errors.amount = 'Amount must be greater than 0'
    return Errors
}

export { walletValidate }