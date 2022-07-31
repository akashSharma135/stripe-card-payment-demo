document.addEventListener('DOMContentLoaded', async () => {
    // Initializing stripe instance
    const stripe = Stripe('pk_test_51KtaBsCJVR68fF0JHGWCCMuDoEF4UH1xwhJ3yGEmdZXIw2I1FWpxRPMG8gev1CbBteBrZnHpRY8piWw5d4Af6btf00Crt8JKOY')
    const elements = stripe.elements();

    // Stripe elements style
    var style = {
        base: {
          iconColor: '#666EE8',
          color: '#31325F',
          lineHeight: '30px',
          fontWeight: 300,
          fontFamily: 'Helvetica Neue',
          fontSize: '15px',
       
          '::placeholder': {
            color: '#CFD7E0',
          },
        },
      };

    var displayError = document.getElementById('card-errors');
    displayError.style.display = 'none';

    // create and mount stripe elements
    const cardNumberElement = elements.create('cardNumber', {
        style: style,
        showIcon: true
    });
    cardNumberElement.mount('#card-number-element');

    cardNumberElement.on('change', function(event) {
        if (event.error) {
            displayError.style.display = 'block';
            displayError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${event.error.message}`;
        } else {
            displayError.textContent = '';
            displayError.style.display = 'none';
        }
    });

    const cardExpiryElement = elements.create('cardExpiry', {
        style: style
    });
    cardExpiryElement.mount('#card-expiry-element');

    cardExpiryElement.on('change', function(event) {
        if (event.error) {
            displayError.style.display = 'block';
            displayError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${event.error.message}`;
        } else {
            displayError.textContent = '';
            displayError.style.display = 'none';
        }
    });

    const cardCvcElement = elements.create('cardCvc', {
        style: style
    });
    cardCvcElement.mount('#card-cvc-element');

    cardCvcElement.on('change', function(event) {
        if (event.error) {
            displayError.style.display = 'block';
            displayError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${event.error.message}`;
        } else {
            displayError.textContent = '';
            displayError.style.display = 'none';
        }
    });

    const urlString = new URL(window.location.href);
    const paymentIntentId = urlString.searchParams.get("p_id");
    const ticketId = urlString.searchParams.get("id");
    const form = document.querySelector('#paymentForm');
    let emailInput = document.querySelector('#email-address');     // email entered by user while making payment
    let fullName = document.querySelector('#full-name');
    let productAmount = null;
    let chargeAmount = null;
    let clientSecret = null;

    document.getElementById('try-again').addEventListener('click', () => {
        document.getElementById('error-modal').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    });
    
    fetch('/payment-detail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "paymentIntentId": paymentIntentId
        })
    }).then((data) => {
        return data.json()
    }).then((data) => {
        if (data.status == 200) {
            clientSecret = data['clientSecret']
            emailInput.value = data['email'],
            fullName.value = data['fullName'],
            productAmount = data['productAmount']
            chargeAmount = data['productAmount']
            updateAmount();
        }
    }).catch((error) => {
        console.error("ERROR: ", error)
    })

    function updateAmount(discount=0) {
        fetch('/update-payment-amount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentIntentId: paymentIntentId,
                productAmount: chargeAmount,
                ticketId: ticketId,
                discount: discount
            })
        }).then((data) => {
            return data.json()
        }).then((data) => {
            console.log(data)
        }).catch(error => console.error("ERROR: ", error)) 
    }
    

    let apply_coupon_btn = document.getElementById('apply_coupon');
    let new_coupon_btn = document.getElementById('enter_new_coupon');
    new_coupon_btn.style.display = 'none';
    let couponCodeInput = document.getElementById('coupon_code');
    const coupon_section = document.getElementById('coupon-message');
    var couponId = null;

    apply_coupon_btn.addEventListener('click', () => {
        var couponCode = couponCodeInput.value;
        
        fetch('/validate-coupon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: couponCode,
                totalPrice: productAmount,
                paymentIntentId: paymentIntentId
            })
        }).then((data) => {
            return data.json()
        }).then((data) => {
            if (data.status == 200) {
                document.getElementById('charge').innerHTML = data.totalPriceAfterDiscount;
                const couponMessage = document.getElementById('coupon-message');
                couponMessage.style.display = 'block';
                couponMessage.textContent = data.message;
                discount = data.discount;
                couponId = data.coupon_id;
                apply_coupon_btn.style.display = "none";
                new_coupon_btn.style.display = "block";
                updateAmount(discount)
            } else {
                coupon_section.style.display = "block";
                coupon_section.textContent = data.message;
            }
        }).catch((error) => {
            console.error("ERROR: ", error)
        })
    });

    new_coupon_btn.addEventListener('click', () => {
        new_coupon_btn.style.display = "none";
        apply_coupon_btn.style.display = "block";
        couponCodeInput.textContent = "";
        document.getElementById('charge').innerHTML = productAmount;
        coupon_section.style.display = "none";
        updateAmount();
    });

    
    // On checkout form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.scrollTo(0, 0)
        document.querySelector('body').classList.add('preloader');
        // Confirm card payment
        const {paymentIntent, error} = await stripe.confirmCardPayment(
            clientSecret, {
                payment_method: {
                    card: cardNumberElement
                }
            }
        )

        if (paymentIntent && paymentIntent.status == 'succeeded') {
            // Apply coupon if payment succeedes
            fetch('/apply-coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    couponId: couponId
                })
            }).then(data => data.json())
                .then(data => {
                    let amount = (paymentIntent.amount / 100);
                    var live_review = sessionStorage.getItem("live_review");
                    if (live_review == 'true') {
                        window.location = `/continue-booking?amount=${amount}`;
                        sessionStorage.setItem("live_review", false)
                    } else {
                        window.location = `/payment-successful?amount=${amount}`;
                    }
                })
                .catch(error => console.log(error))
        } else {
            updateAmount();
            document.querySelector('body').classList.remove('preloader');
            const error_modal = document.getElementById('error-modal');
            error_modal.style.display = 'block';
            error_modal.style.position = 'fixed';
            error_modal.style.top = '40%';
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('paymentError').textContent = error.code;
            document.getElementById('failureMessage').textContent = error.message;
        }
    });
});


