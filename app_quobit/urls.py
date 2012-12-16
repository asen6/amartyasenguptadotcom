#app_quobit urls

from django.conf.urls.defaults import *


# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('app_quobit.views',
    (r'^$', 'discussion'),
    (r'^register/$', 'register_user'),
    (r'^signin/$', 'signin_user'),
    (r'^send_qpost/$', 'enter_qpost'),
    (r'^send_qreply/$', 'enter_qreply'),
    (r'^get_all_qposts_and_qreplies/$', 'get_all_qposts_and_qreplies'),
    (r'^channel/$', 'channel')
)