#app_bio urls

from django.conf.urls.defaults import *

urlpatterns = patterns('app_bio.views',
    (r'^$', 'index'),
)