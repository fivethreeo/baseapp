from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import *
from django.views.generic import TemplateView


from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', TemplateView.as_view(template_name="index.html")),
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    (r'^admin/', include(admin.site.urls)),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)