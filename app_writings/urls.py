#app_writings urls

from django.conf.urls.defaults import *


# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('app_writings.views',
    (r'^$', 'posts'),
    (r'^(?P<post_url>[\w,-]+)/$', 'post_detail')
)