#!/usr/bin/env python3
import click
import json

def query_text(topic):
    with open('data/topics.rag24.test.txt', 'r') as f:
        for l in f:
            qid, query = l.split('\t')
            if qid == topic:
                return query.strip()
    raise ValueError(f"did not find topic {topic}")

def response_text(topic):
    with open('./data/webis-manual.jsonl', 'r') as f:
        for l in f:
            l = json.loads(l)
            if topic == l['topic_id']:
                ret =  []
                references = l["references"]
                for answer in l["answer"]:
                    refs = []
                    if answer["citations"]:
                        for ref in answer["citations"]:
                            doc_id = references[ref].replace('#', '%23')
                            refs += ["<a href=\"https://chatnoir-webcontent.chatnoir.eu/?index=msmarco-v2.1-segmented&trec-id=" + doc_id + "\">" + str(ref + 1) + "</a>"]
                    txt = answer["text"]
                    if refs:
                        txt += "[" + (", ".join(refs)) + "]"
                    ret += [txt]
                #
            
                return '. '.join(ret)
    raise ValueError(f"did not find topic {topic}")

@click.command()
@click.option('--topic', prompt='topic id', help='The person to greet.')
def format_data(topic):
    query = query_text(topic)
    resp = response_text(topic)
    
    with open("rag-talmud-ui/src/data/data.json", "w") as f:
        f.write(json.dumps({"query": query, "response": resp, "leftCommentary": ["Commentary 1", "Commentary 2"], "rightCommentary": ["Authoritative note 1", "Authoritative note 2"], "references": ["Source A", "Source B"]}, indent=2))


if __name__ == '__main__':
    format_data()

