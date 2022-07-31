from django.contrib import admin

from product.models import Product


class ProductAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    list_display = ('name', 'slug')

admin.site.register(Product, ProductAdmin)
