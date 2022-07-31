from django.contrib import admin
from django.urls import path
from payment.views import checkout, create_payment_intent, payment_successful
from django.conf import settings
from django.conf.urls.static import static

from product.views import product_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('products/', product_page, name='product_page'),
    path('checkout/<slug:product_slug>', checkout, name='checkout'),
    path('create-payment-intent/', create_payment_intent, name='create_payment_intent'),
    path('successful/', payment_successful, name='payment_successful')
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
