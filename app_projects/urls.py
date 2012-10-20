#app_projects urls

from django.conf.urls.defaults import *

urlpatterns = patterns('app_projects.views',
    (r'^$', 'index'),
)