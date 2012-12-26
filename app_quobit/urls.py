#app_quobit urls

from django.conf.urls.defaults import *


# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('app_quobit.views',
    (r'^$', 'events'),
    (r'^event/(?P<event_id>[\w,-]+)/$', 'event'),
    (r'^create_event/$', 'create_event'),
    (r'^set_user/$', 'set_user'),
    (r'^send_qpost/$', 'enter_qpost'),
    (r'^send_qreply/$', 'enter_qreply'),
    (r'^get_all_qposts_and_qreplies/$', 'get_all_qposts_and_qreplies'),
    (r'^channel/$', 'channel')
)