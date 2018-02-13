run: merge
	docker-compose -f docker-compose.merged.yml up
	
down: merge
	docker-compose -f docker-compose.merged.yml down
	
merge:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml config > docker-compose.merged.yml