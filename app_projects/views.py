#app_projects views

from django.core.cache import cache
from django.contrib.auth.forms import UserCreationForm
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template
#from guestbook.forms import CreateGreetingForm
#from guestbook.models import Greeting

from django.template import Context, loader
from django.http import HttpResponse

#MEMCACHE_GREETINGS = 'greetings'


def index(request):
    t = loader.get_template('app_projects/projects.html')
    c = Context({
    })
    return HttpResponse(t.render(c))