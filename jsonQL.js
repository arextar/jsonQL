jsonQuery=(function(undefined){
function get(obj,str,s){
    str=str.split(".")
    for(x in str){
        obj=obj[str[x]]
        if(obj==undefined) return undefined;
    }
    return obj;
}

function set(obj,str,val,x,last){
    str=str.split(".")
    last=str.pop();
    for(x in str){
        if(obj[str[x]]==undefined){
            obj[str[x]]={}
        }
        obj=obj[str[x]];
    }
    obj[last]=val;
}

function test(ret,current,what,fn,end){
    
    var cur=[],tests={};
    for(x=0;x<current.length;x++) cur[x]=current[x];
    
    for(x in testFns){
        (function(x,t){
            
        tests[x]=function(c,x){
            for(x=0;x<cur.length;x++){
                t(get(cur[x],what),c)&&fn(cur[x]);
            }
            end&&end();
            return ret;
        }
        
        })(x,testFns[x]);
    }
    
    return tests;
}

function filter(data,fn){
    var ret=[];
    return {
        where:function(what){
            
            return test(this,data,what,function(row){
                ret.push(row)
            });
        },
        and:function(what){
            var stack=[];
          return test(this,ret,what,function(row){
            stack.push(row);
          },function(){
            ret=stack;
          })
        },
        or:function(what){
            return test(this,data,what,function(row){
                ret.push(row)
            });
        },
        get:function(){
            var res=[],x;
            for(x=0;x<ret.length;x++) res[x]=fn(ret[x])
            return res;
        }
    }
}

function jsonQuery(data){
    
    return {
        select:function(what){
            return filter(data, function(row){
                return get(row, what);
            })
        },
        update:function(what){
            return filter(data, function(row){
                return set(row, what);
            })
        }
    }
    
}

var testFns=jsonQuery.test={
    eq:function(a,b){
        return a==b;
    },
    lt:function(a,b){
        return a<b;
    },
    gt:function(a,b){
        return a>b;
    },
    like:function(a,b){
        return (""+a).indexOf(b)>=0
    },
    is:function(a,b){
        return b(a);
    }
}

return jsonQuery
})();