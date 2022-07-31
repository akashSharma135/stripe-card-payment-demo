function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const confirmPayment = async (stripe, clientSecret, cardNumberElement) => {
    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: cardNumberElement
        }
    });

    if (paymentIntent) {
        console.log(paymentIntent);
        console.log(window.location.pathname.split('/'))
        window.location.href = `${window.location.pathname.split('/')[0]}/successful/?amount=${(paymentIntent.amount) / 100}`;
    } else if (error) {
        console.log(error)
    }
}


document.addEventListener('DOMContentLoaded', async () => {

    // Product Name
    const slug = window.location.pathname.split('/')[2];

    // Initializing stripe instance
    const stripe = Stripe('pk_test_51KtaBsCJVR68fF0JHGWCCMuDoEF4UH1xwhJ3yGEmdZXIw2I1FWpxRPMG8gev1CbBteBrZnHpRY8piWw5d4Af6btf00Crt8JKOY');
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

    cardNumberElement.on('change', function (event) {
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

    cardExpiryElement.on('change', function (event) {
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

    cardCvcElement.on('change', function (event) {
        if (event.error) {
            displayError.style.display = 'block';
            displayError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${event.error.message}`;
        } else {
            displayError.textContent = '';
            displayError.style.display = 'none';
        }
    });


    // Create Payment Intent on form submission
    document.getElementById('paymentForm').addEventListener('submit', (event) => {
        event.preventDefault();
        fetch('/create-payment-intent/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({
                "productName": slug
            })
        }).then((data) => {
            return data.json()
        }).then((data) => {
            if (data.status == 200) {
                // on payment intent success
                confirmPayment(stripe, data.clientSecret, cardNumberElement);
            }
        }).catch((error) => {
            console.error("ERROR: ", error);
        })
    })
});