#app_quobit views

from django.core.cache import cache
from django.contrib.auth.forms import UserCreationForm
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template
from django.shortcuts import render_to_response, get_object_or_404

from django.template import Context, loader
from django.http import HttpResponse

#MEMCACHE_GREETINGS = 'greetings'



from app_quobit.models import QPost, QReply


def discussion(request):
	if QPost.objects.all().count() == 0:
		return direct_to_template(request, 'app_quobit/index.html')
	else:
		latest_qpost = QPost.objects.all().order_by('-published_on')[0]
		latest_qpost_id = str(latest_qpost.id)
		return HttpResponseRedirect('/projects/quobit/qpost_replies/'+latest_qpost_id+'/')


def post_detail(request, qpost_id):
	latest_qposts_list = QPost.objects.all().order_by('-published_on')
	selected_qpost = get_object_or_404(QPost, id=qpost_id)
	latest_qreplies_list = QReply.objects.filter(qpost=selected_qpost)
	latest_qreplies_list = latest_qreplies_list.order_by('published_on')
	return direct_to_template(request, 'app_quobit/index.html',
		{'latest_qposts_list': latest_qposts_list,
		'latest_qreplies_list': latest_qreplies_list,
		'selected_qpost': selected_qpost})

def enter_qpost(request):
	if request.method == 'POST':
		qpost = QPost(content=request.POST['new_qpost_text'])
		qpost.save()
	return HttpResponseRedirect('/projects/quobit')

def enter_qreply(request, qpost_id):
	if request.method == 'POST':
		selected_qpost = get_object_or_404(QPost, id=qpost_id)
		qreply = QReply(content=request.POST['new_qreply_text'], qpost=selected_qpost)
		qreply.save()
	return HttpResponseRedirect('/projects/quobit/qpost_replies/'+qpost_id+'/')