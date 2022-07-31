from django.shortcuts import render

from .models import Product


def product_page(request):
    products = Product.objects.all()

    context = {
        "products": products
    }
    
    return render(
        request=request, 
        template_name='product/product.html', 
        context=context
    )
