#app_writings views

from django.core.cache import cache
from django.contrib.auth.forms import UserCreationForm
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template
from django.shortcuts import render_to_response, get_object_or_404
#from guestbook.forms import CreateGreetingForm
#from guestbook.models import Greeting

from django.template import Context, loader
from django.http import HttpResponse

#MEMCACHE_GREETINGS = 'greetings'



from app_writings.models import BaseContent, Post


def posts(request):
	latest_posts_list = Post.objects.all().order_by('-published_on')
	return direct_to_template(request, 'app_writings/index.html',
		{'latest_posts_list': latest_posts_list})

def post_detail(request, post_url):
	post = get_object_or_404(Post, url=post_url)
	return direct_to_template(request, 'app_writings/article.html',
		{'post': post})


