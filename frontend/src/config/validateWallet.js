
const walletValidate = (amount, description) => {
    let Errors = {};
    if (!amount) Errors.amount = 'Amount is required'
    if (isNaN(amount)) Errors.amount = 'Amount want to be number'

    return Errors
}

export { walletValidate }