#app_quobit urls

from django.conf.urls.defaults import *


# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('app_quobit.views',
    (r'^$', 'discussion'),
    (r'^qpost_replies/(?P<qpost_id>\d+)/$', 'post_detail'),
    (r'^send_qpost/$', 'enter_qpost'),
    (r'^qpost_replies/(?P<qpost_id>\d+)/send_qreply/$', 'enter_qreply')
)