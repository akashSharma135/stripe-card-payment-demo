import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import stripe

from django.shortcuts import render

from product.models import Product


def checkout(request, product_slug):
    product = Product.objects.get(slug=product_slug)

    context = {
        "product_name": product.name,
        "product_price": product.price
    }

    return render(
        request=request,
        template_name='payment/checkout.html',
        context=context
    )


@csrf_exempt
def create_payment_intent(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY

    if request.method == 'POST':
        body = json.loads(request.body)
        product_name = body.get('productName')

        product = Product.objects.get(slug=product_name)


        payment_intent = stripe.PaymentIntent.create(
            amount=int(product.price * 100),
            currency="usd",
            payment_method_types=["card"],
        )

        return JsonResponse({
            "status": 200,
            "clientSecret": payment_intent.client_secret
        })


def payment_successful(request):
    amount = request.GET.get('amount')

    context = {
        "amount": amount
    }

    return render(
        request=request,
        template_name='payment/success.html',
        context=context
    )