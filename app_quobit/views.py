#app_quobit views

from django.core.cache import cache
from django.contrib.auth.forms import UserCreationForm
from django.views.generic.simple import direct_to_template
from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template
from django.shortcuts import render_to_response, get_object_or_404

from django.template import Context, loader
from django.http import HttpResponse

import json
from django.core import serializers
json_serializer = serializers.get_serializer("json")()

#MEMCACHE_GREETINGS = 'greetings'

import time



from app_quobit.models import QPost, QReply


def discussion(request):
	return direct_to_template(request, 'app_quobit/index.html')
	# if QPost.objects.all().count() == 0:
	# 	return direct_to_template(request, 'app_quobit/index.html')
	# else:
	# 	latest_qpost = QPost.objects.all().order_by('-published_on')[0]
	# 	latest_qpost_id = str(latest_qpost.id)
	# 	return HttpResponseRedirect('/projects/quobit/qpost_replies/'+latest_qpost_id+'/')


# def post_detail(request, qpost_id):
# 	latest_qposts_list = QPost.objects.all().order_by('-published_on')
# 	selected_qpost = get_object_or_404(QPost, id=qpost_id)
# 	latest_qreplies_list = QReply.objects.filter(qpost=selected_qpost)
# 	latest_qreplies_list = latest_qreplies_list.order_by('published_on')
# 	return direct_to_template(request, 'app_quobit/index.html',
# 		{'latest_qposts_list': latest_qposts_list,
# 		'latest_qreplies_list': latest_qreplies_list,
# 		'selected_qpost': selected_qpost})

def enter_qpost(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		text = request.POST.get('new_qpost_text')
		qpost = QPost(author=username, content=text)
		qpost.save()
		qpost_id = qpost.id
		items_to_return = {'qpost_id': qpost_id}
		return HttpResponse(json.dumps(items_to_return))
	else:
		return HttpResponse()

def enter_qreply(request):
	if request.method == 'POST':
		qpost_id = request.POST.get('qpost_id')
		username = request.POST.get('username')
		text = request.POST['new_qreply_text']
		selected_qpost = get_object_or_404(QPost, id=qpost_id)
		qreply = QReply(author=username, content=text, qpost=selected_qpost)
		qreply_id = qreply.id
		qreply.save()
		items_to_return = {'qreply_id': qreply_id}
		return HttpResponse(json.dumps(items_to_return))
	else: 
		return HttpResponse()


def get_all_qposts_and_qreplies(request):
	current_chat_id = request.GET.get('current_chat_id')
	last_qreply_id = int(request.GET.get('last_qreply_id'))

	latest_qposts_list = QPost.objects.all().order_by('published_on')
	latest_qreplies_list = QReply.objects.filter(qpost__id=current_chat_id).order_by('published_on')

	qposts = []
	qreplies = []

	for curr_qpost in latest_qposts_list:
		curr_qpost_dict = {'qpost_id': curr_qpost.id,
							'author': curr_qpost.author, 
							'content': curr_qpost.content,
							'published_on': time.mktime(curr_qpost.published_on.timetuple())
							}
		qposts.append(curr_qpost_dict)

	for curr_qreply in latest_qreplies_list:
		if curr_qreply.id > last_qreply_id:
			curr_qreply_dict = {'qpost_id': curr_qreply.qpost.id,
								'qreply_id': curr_qreply.id,
								'author': curr_qreply.author, 
								'content': curr_qreply.content,
								'published_on': time.mktime(curr_qreply.published_on.timetuple())
								}
			qreplies.append(curr_qreply_dict)

	items_to_return = {'qposts': qposts, 'qreplies': qreplies}

	return HttpResponse(json.dumps(items_to_return))










	# latest_qposts_list = QPost.objects.all().order_by('-published_on')
	# latest_qreplies_list = QReply.objects.all().order_by('published_on')

	# items_to_return = [{'latest_qposts_list': latest_qposts_list}, {'latest_qreplies_list': latest_qreplies_list}]
	# #return json.dumps(latest_qposts_list, latest_qreplies_list)
	
	# latest_qpost = QPost.objects.all().order_by('-published_on')[0]
	# #return HttpResponse(json_serializer.serialize(items_to_return, ensure_ascii=False))
	# return HttpResponse(json_serializer.serialize(QPost.objects.all(), ensure_ascii=False))
	# #return json.dumps(latest_qpost)

	# #please_work = 10
	# #return HttpResponse(json.dumps({'a': please_work}))

	# #stuff_to_return = json.dumps(['foo', {'bar': ('baz', None, 1.0, 2)}])
	# #return stuff_to_return_2

	# #return































