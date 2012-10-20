from django.conf.urls.defaults import *
#from django.conf.urls import patterns, include, url
from django.contrib.auth.forms import AuthenticationForm

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from django.contrib.auth import authenticate, login, logout

handler500 = 'djangotoolbox.errorviews.server_error'

urlpatterns = patterns('',

    url(r'^$', include('app_bio.urls')),
    url(r'^writings/', include('app_writings.urls')),
    url(r'^projects/', include('app_projects.urls')),
    url(r'^projects/quobit/', include('app_quobit.urls')),

 	# Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

)
