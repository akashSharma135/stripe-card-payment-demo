from django.db import models
from django.urls import reverse


class Product(models.Model):

    class Meta:
        db_table = "Product"

    name = models.CharField(max_length=100, verbose_name='Product Name')
    slug = models.SlugField(max_length=255, unique=True, null=True)
    description = models.TextField(max_length=500, verbose_name='Description')
    price = models.PositiveIntegerField(verbose_name='Product Price')

    def get_url(self):
        """
            returns the slug url of the product
        """
        return reverse('checkout', args=[self.slug])

    def __str__(self) -> str:
        return self.name
