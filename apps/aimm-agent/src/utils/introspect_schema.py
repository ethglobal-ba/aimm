"""
Introspect GraphQL schema to understand available queries and types.
"""

import requests
import json


GRAPHQL_ENDPOINT = "https://aimm.lat/graphql"


def introspect_schema():
    """Fetch the full GraphQL schema"""
    introspection_query = """
    query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
      }
    }

    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
      }
      possibleTypes {
        ...TypeRef
      }
    }

    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
    }

    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
    """

    try:
        response = requests.post(
            GRAPHQL_ENDPOINT,
            json={"query": introspection_query},
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None


def print_query_types(schema_data):
    """Print all available Query fields"""
    if not schema_data or "data" not in schema_data:
        print("No schema data available")
        return

    types = schema_data["data"]["__schema"]["types"]

    # Find the Query type
    query_type = None
    for t in types:
        if t["name"] == "Query":
            query_type = t
            break

    if not query_type or not query_type.get("fields"):
        print("No Query type found")
        return

    print("\n" + "="*80)
    print("AVAILABLE QUERIES")
    print("="*80)

    for field in query_type["fields"]:
        name = field["name"]
        args = field.get("args", [])
        return_type = field.get("type", {})

        print(f"\n{name}")
        if args:
            print("  Arguments:")
            for arg in args:
                arg_name = arg["name"]
                arg_type = format_type(arg["type"])
                print(f"    - {arg_name}: {arg_type}")

        print(f"  Returns: {format_type(return_type)}")


def print_market_type(schema_data):
    """Print the market type structure"""
    if not schema_data or "data" not in schema_data:
        return

    types = schema_data["data"]["__schema"]["types"]

    market_type = None
    for t in types:
        if t["name"] == "market":
            market_type = t
            break

    if not market_type:
        print("\nNo 'market' type found")
        return

    print("\n" + "="*80)
    print("MARKET TYPE FIELDS")
    print("="*80)

    if market_type.get("fields"):
        for field in market_type["fields"]:
            name = field["name"]
            field_type = format_type(field.get("type", {}))
            description = field.get("description", "")

            print(f"\n{name}: {field_type}")
            if description:
                print(f"  {description}")


def format_type(type_obj):
    """Format a GraphQL type for display"""
    if not type_obj:
        return "Unknown"

    kind = type_obj.get("kind")
    name = type_obj.get("name")
    of_type = type_obj.get("ofType")

    if kind == "NON_NULL":
        return f"{format_type(of_type)}!"
    elif kind == "LIST":
        return f"[{format_type(of_type)}]"
    elif name:
        return name
    elif of_type:
        return format_type(of_type)
    else:
        return "Unknown"


if __name__ == "__main__":
    print("Introspecting GraphQL schema...")
    schema = introspect_schema()

    if schema:
        print_query_types(schema)
        print_market_type(schema)

        # Save full schema to file
        with open("graphql_schema.json", "w") as f:
            json.dump(schema, f, indent=2)
        print("\n✅ Full schema saved to graphql_schema.json")
    else:
        print("Failed to introspect schema")
